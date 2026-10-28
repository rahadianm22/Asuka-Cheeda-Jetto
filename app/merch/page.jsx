import './merch.css';
import TopBar from '@/components/TopBar';
import { notFound } from 'next/navigation';
import MerchShell from '@/components/Merch/MerchShell';
import { merchEnabled } from '@/lib/merch-flag';
import { getProducts } from '@/lib/products';
import { getPOStatus, closedUiFor } from '@/lib/po-config';

// Stock and the open/closed state change per request.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Merch CF23 · Website Asuka Jetto',
  description: 'Merch Asuka Jetto untuk Comic Frontier 23: pre-order dengan harga PO, dan adopsi langsung di booth PKK AC 33-34.',
};

// ?po=closed previews the closed page and (outside production) ?po=open the form. It only changes what is shown:
// the order API still decides from the real clock.
export default async function MerchPage({ searchParams }) {
  if (!merchEnabled()) notFound();

  const { po } = await searchParams;
  const products = await getProducts();
  const status = getPOStatus();
  const closed = closedUiFor(status, Array.isArray(po) ? po[0] : po);

  return (
    <>
      <div className="pawlayer" aria-hidden="true" />
      <TopBar />
      <MerchShell products={products} status={status} closed={closed} />
    </>
  );
}
