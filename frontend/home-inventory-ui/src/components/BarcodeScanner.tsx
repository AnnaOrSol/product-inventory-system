import { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
}

export function BarcodeScanner({ onScanSuccess }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        const scannerId = "reader";

        scannerRef.current = new Html5Qrcode(scannerId, {
            formatsToSupport: [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
            ],
            verbose: false
        });

        const startScanner = async () => {
            try {
                await scannerRef.current?.start(
                    { facingMode: "environment" },
                    {
                        fps: 15,
                        qrbox: { width: 250, height: 150 },
                    },
                    (decodedText) => {
                        if (scannerRef.current?.isScanning) {
                            scannerRef.current.stop().then(() => {
                                onScanSuccess(decodedText);
                            });
                        }
                    },
                    () => { }
                );
            } catch (err) {
                console.error("Scanner start error:", err);
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(err => console.error("Stop error", err));
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-xl border-4 border-primary">
            <div id="reader" className="w-full bg-black"></div>
            <div className="absolute inset-0 border-2 border-red-500 opacity-50 pointer-events-none m-auto w-[250px] h-[150px]"></div>
            <p className="text-center bg-primary text-white text-xs py-1">align the bacode inside the frame</p>
        </div>
    );
}