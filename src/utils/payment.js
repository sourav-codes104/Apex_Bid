import { Cashfree } from "cashfree-pg";

export async function startCashfreePayment(sessionId) {
  const cashfree = new Cashfree({
    mode: "sandbox"   // test mode
  });

  cashfree.checkout({
    paymentSessionId: sessionId,
    redirectTarget: "_self"
  });
}
