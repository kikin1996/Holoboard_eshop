interface PageProps {
  searchParams: { orderNumber?: string; demo?: string };
}

// Zákazník sem přijde po návratu z ComGate (redirectUrl). Stránka NESMÍ
// sama o sobě označit objednávku za zaplacenou - o tom rozhoduje jen
// ověřený webhook (app/api/webhooks/comgate/route.ts). Tady se v reálném
// projektu jen zeptáme vlastního backendu na aktuální (ověřený) stav.
export default function ThankYouPage({ searchParams }: PageProps) {
  return (
    <div className="mx-auto max-w-xl space-y-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Děkujeme za objednávku</h1>
      <p>
        Číslo objednávky: <strong>{searchParams.orderNumber}</strong>
      </p>
      {searchParams.demo && (
        <p className="text-sm text-gray-500">
          Demo režim - ComGate proměnné nejsou nastavené, platba proto proběhla
          jen naoko.
        </p>
      )}
      <p className="text-sm text-gray-500">
        Stav platby si ověřujeme u ComGate na pozadí (webhook), potvrzení
        dorazí e-mailem.
      </p>
    </div>
  );
}
