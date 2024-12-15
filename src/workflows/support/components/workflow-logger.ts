// src/workflows/support/components/ticket-received.ts
import { type Emit } from "../../../motia";

export const subscribe = ["*"];

export async function ticketReceived(
  input: { text: string; userId: string },
  emit: Emit
) {
  console.log("Running:", input);
}

export default ticketReceived;
