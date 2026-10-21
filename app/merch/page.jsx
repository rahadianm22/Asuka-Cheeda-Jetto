import './merch.css';
import TopBar from '@/components/TopBar';
import Ticker from '@/components/Ticker';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import MerchApp from '@/components/Merch/MerchApp';
import { merchEnabled } from '@/lib/merch-flag';
import { getProducts } from '@/lib/products';
import { getPOStatus } from '@/lib/po-config';
import { COPY } from '@/lib/merch-copy';

// Stock and the open/closed state change per request.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Merch PO CF23 · Website Asuka Jetto',
  description: 'Formulir pre-order merch Asuka Jetto untuk Comic Frontier 23. Harga PO lebih hemat dari OTS, bayar langsung di booth.',
};

export default async function MerchPage() {
  if (!merchEnabled()) notFound();

  const products = await getProducts();

  return (
    <>
      <div className="pawlayer" aria-hidden="true" />
      <TopBar />
      <Ticker items={COPY.ticker} />
      <div className="wrap">
        <main className="merch">
          <MerchApp products={products} status={getPOStatus()} />
        </main>
        <Footer />
      </div>
    </>
  );
}
