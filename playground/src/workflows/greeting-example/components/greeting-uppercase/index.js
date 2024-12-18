export const subscribe = ["greeting.generated"];

export default async function greetingUppercase(input, emit) {
  const uppercased = input.text.toUpperCase();
  await emit({ type: "greeting.uppercased", data: { text: uppercased } });
}
