"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

export function useFaceLogic(onIdleChange?: (isIdle: boolean) => void) {
    // Use a ref for isIdle to avoid dependency cycles in effect
    const isIdleRef = useRef(false);
    const [isIdleState, setIsIdleState] = useState(false);
    const lastActivityRef = useRef(Date.now());

    const resetActivity = useCallback(() => {
        lastActivityRef.current = Date.now();
        if (isIdleRef.current) {
            isIdleRef.current = false;
            setIsIdleState(false);
            onIdleChange?.(false);
        }
    }, [onIdleChange]);

    useEffect(() => {
        // Listen for activity events
        const handleActivity = () => resetActivity();

        window.addEventListener('user-activity', handleActivity);
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('click', handleActivity);

        // Check interval
        const interval = setInterval(() => {
            const now = Date.now();
            const diff = now - lastActivityRef.current;

            if (diff > 30000 && !isIdleRef.current) { // 30 seconds
                isIdleRef.current = true;
                setIsIdleState(true);
                onIdleChange?.(true);

                // Trigger specific idle action: Message
                window.dispatchEvent(new CustomEvent('mole-message', {
                    detail: "Agent: Is everything okay? Do you need a hint?"
                }));

                // Ideally, we would also send a LiveKit data message here to trigger voice.
                // That connection needs to be passed in or accessed via context.
            }
        }, 1000);

        return () => {
            window.removeEventListener('user-activity', handleActivity);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('click', handleActivity);
            clearInterval(interval);
        };
    }, [resetActivity, onIdleChange]);

    return { isIdle: isIdleState, resetActivity };
}
