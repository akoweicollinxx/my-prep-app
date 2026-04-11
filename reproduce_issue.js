const pdf = require('pdf-parse');
const fs = require('fs');

async function test() {
    console.log('Starting PDF parsing test...');
    try {
        // Create a minimal PDF buffer (this is just the header, but pdf-parse should try to parse it)
        const dummyBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 100 700 Td (Hello World) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000060 00000 n \n0000000116 00000 n \n0000000222 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n317\n%%EOF');
        
        console.log('Calling pdf-parse...');
        const data = await pdf(dummyBuffer);
        console.log('PDF parsed successfully. Text:', data.text);
    } catch (error) {
        console.error('PDF parsing failed:', error);
    }
}

test();
