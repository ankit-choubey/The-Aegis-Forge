"use client";

import { useEffect, useRef } from 'react';
import { Terminal as XTerminal } from 'xterm';
import 'xterm/css/xterm.css';

export default function TerminalComponent() {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerminal | null>(null);
    // Keep track if we have initialized to avoid double init
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!terminalRef.current) return;

        const container = terminalRef.current;

        const initTerminal = () => {
            if (initializedRef.current) return;
            // Safety check: ensure container has size before open, OR force it if passing via timeout
            if (container.clientWidth === 0 || container.clientHeight === 0) {
                // If we are here via timeout and still 0, we might be hidden or in a bad layout
                // We will try to init anyway if this is a "force" scenario? 
                // Actually, xterm 0x0 throws error. So we must have non-zero.
                return;
            }

            initializedRef.current = true;

            // Initialize xterm with safe defaults
            const term = new XTerminal({
                cursorBlink: true,
                cols: 80,
                rows: 24,
                theme: {
                    background: '#09090b', // Zinc-950
                    foreground: '#f4f4f5', // Zinc-100
                },
                fontFamily: 'monospace',
            });

            // Open terminal in the container
            term.open(container);

            // Simple welcome message
            term.writeln('\x1b[1;32mWelcome to Aegis Forge Terminal\x1b[0m');
            term.writeln('System initialized...');
            term.writeln('$ ');

            // Handle user input
            term.onData(data => {
                const code = data.charCodeAt(0);
                if (code === 13) { // Enter
                    term.write('\r\n$ ');
                } else if (code === 127) { // Backspace
                    term.write('\b \b');
                } else {
                    term.write(data);
                }
                window.dispatchEvent(new Event('user-activity'));
            });

            xtermRef.current = term;
        };

        // Use ResizeObserver to wait for NON-ZERO dimensions
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                    // We have dimensions! Init if not already done.
                    if (!initializedRef.current) {
                        // Wrap in requestAnimationFrame to ensure layout is stable
                        requestAnimationFrame(initTerminal);
                    }
                }
            }
        });

        resizeObserver.observe(container);

        // Fallback Force Init
        setTimeout(() => {
            if (!initializedRef.current && container.clientWidth > 0) {
                console.log("Forcing Terminal Init via Timeout");
                initTerminal();
            }
        }, 500);

        return () => {
            resizeObserver.disconnect();
            if (xtermRef.current) {
                xtermRef.current.dispose();
                xtermRef.current = null;
            }
            initializedRef.current = false;
        };
    }, []);

    return (
        <div className="w-full h-full bg-zinc-950 p-4 overflow-hidden rounded-b-lg border-t border-zinc-800">
            <div ref={terminalRef} className="w-full h-full" />
        </div>
    );
}
