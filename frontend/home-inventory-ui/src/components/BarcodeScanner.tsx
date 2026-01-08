import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
}

export function BarcodeScanner({ onScanSuccess }: BarcodeScannerProps) {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 150 },
                aspectRatio: 1.0
            },
            false
        );

        scanner.render(
            (decodedText) => {
                scanner.clear();
                onScanSuccess(decodedText);
            },
            (error) => {
            }
        );

        return () => {
            scanner.clear().catch(e => console.error("Scanner cleanup failed", e));
        };
    }, [onScanSuccess]);

    return (
        <div className="relative w-full overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20">
            <div id="reader" className="w-full"></div>
            <p className="p-2 text-center text-xs text-muted-foreground">Position the barcode inside the frame</p>
        </div>
    );
}