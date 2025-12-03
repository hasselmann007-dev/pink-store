export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cart, customer, paymentMethod, bumpAdded } = req.body;
    // 👉 aqui entra a lógica que hoje está no app.post("/api/checkout")

    return res.status(200).json({
      success: true,
      message: "Checkout criado com sucesso (serverless)",
    });
  } catch (error) {
    console.error("Erro no /api/checkout:", error);
    return res.status(500).json({ success: false, message: "Erro no checkout" });
  }
}
