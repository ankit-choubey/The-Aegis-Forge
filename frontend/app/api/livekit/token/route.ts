import { AccessToken, AgentDispatchClient } from 'livekit-server-sdk';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const room = req.nextUrl.searchParams.get('room') || 'default-room';
    const username = req.nextUrl.searchParams.get('username') || 'user-' + Math.random().toString(36).substring(7);

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret) {
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // 1. Generate token for user
    const at = new AccessToken(apiKey, apiSecret, { identity: username });
    at.addGrant({ roomJoin: true, room: room, canPublish: true, canSubscribe: true });

    // 2. Dispatch the agent to this room
    try {
        if (livekitUrl) {
            const dispatchClient = new AgentDispatchClient(livekitUrl, apiKey, apiSecret);
            await dispatchClient.createDispatch(room, 'aegis-interviewer');
            console.log(`[Token API] Dispatched aegis-interviewer to room: ${room}`);
        }
    } catch (dispatchError) {
        console.error('[Token API] Agent dispatch failed:', dispatchError);
        // Continue anyway - token is still valid, agent might connect via auto-dispatch
    }

    return NextResponse.json({ token: await at.toJwt() });
}
