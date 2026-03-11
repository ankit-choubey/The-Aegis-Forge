import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile, rm, mkdir } from 'fs/promises';
import path from 'path';
import os from 'os';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { language, version, files } = body;

        if (!files || !files.length || !files[0].content) {
            return NextResponse.json({ run: { code: 1, stderr: "No code provided" } });
        }

        const code = files[0].content;
        const tempDirPath = path.join(os.tmpdir(), `aegis-exec-${Date.now()}`);
        
        // Ensure isolated directory
        await mkdir(tempDirPath, { recursive: true });

        let command = "";
        let filepath = "";

        if (language === "python" || language === "python3") {
            filepath = path.join(tempDirPath, "script.py");
            await writeFile(filepath, code);
            command = `python3 ${filepath}`;
        } else if (language === "javascript" || language === "nodejs") {
            filepath = path.join(tempDirPath, "script.js");
            await writeFile(filepath, code);
            command = `node ${filepath}`;
        } else if (language === "typescript") {
            filepath = path.join(tempDirPath, "script.ts");
            const jspath = path.join(tempDirPath, "script.js");
            await writeFile(filepath, code);
            command = `npx --no-install tsc ${filepath} && node ${jspath}`;
        } else if (language === "c++" || language === "cpp") {
            filepath = path.join(tempDirPath, "script.cpp");
            const binpath = path.join(tempDirPath, "a.out");
            await writeFile(filepath, code);
            command = `g++ ${filepath} -o ${binpath} && ${binpath}`;
        } else if (language === "java") {
            filepath = path.join(tempDirPath, "Main.java");
            await writeFile(filepath, code);
            command = `cd ${tempDirPath} && javac Main.java && java Main`;
        } else {
            return NextResponse.json({ run: { code: 1, stderr: `Language ${language} not supported locally` } });
        }

        // Execute Command
        const execPromise = new Promise<{stdout: string, stderr: string, code: number}>((resolve) => {
            // Prevent infinite loops (10s timeout)
            exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
                if (error) {
                    if (error.killed) {
                        resolve({ stdout, stderr: "Execution timed out (10s limit)", code: 143 });
                    } else {
                        resolve({ stdout, stderr: stderr || error.message, code: error.code || 1 });
                    }
                } else {
                    resolve({ stdout, stderr, code: 0 });
                }
            });
        });

        const result = await execPromise;

        // Cleanup Temp Files safely
        try {
            await rm(tempDirPath, { recursive: true, force: true });
        } catch (e) {
            console.error("Failed cleanup:", e);
        }

        return NextResponse.json({
            run: {
                stdout: result.stdout,
                stderr: result.stderr,
                code: result.code
            }
        });

    } catch (e: any) {
        return NextResponse.json(
            { run: { code: 1, stderr: e.message || "Unknown execution error" } },
            { status: 500 }
        );
    }
}
