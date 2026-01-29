import { handleUpload } from '@vercel/blob/client';

export const config = {
    runtime: 'nodejs',
};

export default async function handler(request, response) {
    const body = await new Promise((resolve, reject) => {
        let buffers = [];
        request.on('data', (chunk) => buffers.push(chunk));
        request.on('end', () => {
            try {
                resolve(JSON.parse(Buffer.concat(buffers).toString()));
            } catch (e) {
                reject(e);
            }
        });
        request.on('error', reject);
    });

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                return {
                    allowedContentTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/x-pdf'],
                    tokenPayload: JSON.stringify({}),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // console.log('blob uploaded', blob.url);
            },
        });

        response.status(200).json(jsonResponse);
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
}
