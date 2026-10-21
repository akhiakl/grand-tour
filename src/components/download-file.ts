/** Save text the page generated (backup, calendar) as a file download. */
export function downloadFile(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  // Let the click start the download before the URL goes away.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
