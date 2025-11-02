export interface FileSystemAdapter {
	stat(filePath: string): Promise<{ isFile(): boolean }>;
	readFile(filePath: string): Promise<string>;
}
