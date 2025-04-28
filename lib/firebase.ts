// lib/uploadFile.ts
import { storage } from "@/lib/firebase"; // импортируем storage
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export async function uploadFileToStorage(file: File, onProgress?: (progress: number) => void): Promise<string> {
    // Создаём уникальный путь для файла
    const storageRef = ref(storage, `files/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        // Отслеживаем прогресс загрузки
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);
            },
            (error) => {
                reject(error);
            },
            async () => {
                // Получаем URL загруженного файла
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            }
        );
    });
}
