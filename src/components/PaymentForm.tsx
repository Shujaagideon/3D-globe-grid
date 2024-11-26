import { useState, useEffect } from "react"
import { PayPalButtons } from "@paypal/react-paypal-js"
import { useAction } from "convex/react"
import { api } from "../../convex/_generated/api"

interface PaymentFormProps {
  amount: number
  pixelIds: string[]
  onSuccess: () => void
}

export function PaymentForm({ amount, pixelIds, onSuccess }: PaymentFormProps) {
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const createPayment = useAction(api.payments.createPayment)
  const capturePayment = useAction(api.payments.capturePayment)

  useEffect(() => {
    const script = document.createElement("script")
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`
    script.async = true
    script.onload = () => setPaypalLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  if (!paypalLoaded) {
    return <div>Loading PayPal...</div>
  }

  return (
    <div className="space-y-4">
      <div className="text-lg font-bold">
        Total Amount: ${amount.toFixed(2)}
      </div>
      <PayPalButtons
        createOrder={async () => {
          const { orderId } = await createPayment({ amount, pixelIds })
          return orderId
        }}
        onApprove={async (data: { orderID: any; paymentId: any }) => {
          if (data.orderID) {
            const result = await capturePayment({
              orderId: data.orderID,
              paymentId: data.paymentId,
            })
            if (result.success) {
              onSuccess()
            } else {
              console.error("Failed to capture payment")
            }
          }
        }}
      />
    </div>
  )
}