// src/workflows/support/components/ticket-received.ts

export const subscribe = ["*"];

export async function ticketReceived(input, emit) {
  console.log("Running:", input);
}

export default ticketReceived;
