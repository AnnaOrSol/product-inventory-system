import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
}

export function BarcodeScanner({ onScanSuccess }: BarcodeScannerProps) {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 150 } },
            /* verbose= */ false
        );

        scanner.render((decodedText) => {
            scanner.clear();
            onScanSuccess(decodedText);
        }, (error) => {
        });

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, []);

    return <div id="reader" className="w-full overflow-hidden rounded-lg border-2 border-dashed" />;
}