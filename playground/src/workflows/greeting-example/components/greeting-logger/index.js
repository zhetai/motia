export const subscribe = ["greeting.final"];

export default async function greetingLogger(input) {
  console.log("Final greeting:", input.text);
}
