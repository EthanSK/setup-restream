export function getTmpFolder() {
  return process.env.TMP_FOLDER || "./tmp";
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getRandomElement(array: any[]) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
