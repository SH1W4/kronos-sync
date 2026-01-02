'use client'

import React, { useEffect, useRef } from 'react'
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode'

interface QrScannerProps {
    onScanSuccess: (decodedText: string) => void
    onScanFailure?: (error: string) => void
    fps?: number
    qrbox?: number
    aspectRatio?: number
}

export function QrScanner({
    onScanSuccess,
    onScanFailure,
    fps = 10,
    qrbox = 250,
    aspectRatio = 1.0
}: QrScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)

    useEffect(() => {
        // Initialize scanner
        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
                fps,
                qrbox,
                aspectRatio,
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
            },
            /* verbose= */ false
        )

        scanner.render(onScanSuccess, onScanFailure)
        scannerRef.current = scanner

        // Cleanup on unmount
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
            }
        }
    }, [onScanSuccess, onScanFailure, fps, qrbox, aspectRatio])

    return (
        <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
            <div id="qr-reader" className="w-full"></div>

            {/* CyberHUD Overlays */}
            <div className="absolute inset-0 pointer-events-none border-2 border-primary/20 opacity-30">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary"></div>
            </div>

            {/* Scanline Animation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="w-full h-1 bg-primary/40 shadow-[0_0_15px_var(--primary)] animate-scan"></div>
            </div>
        </div>
    )
}
