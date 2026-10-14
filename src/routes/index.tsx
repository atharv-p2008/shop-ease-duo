import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShoppingBag, Search, Plus, Minus, Trash2, Pencil, X, AlertTriangle, Package, DollarSign, PackageX } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShopEase — Shop & Manage Inventory" },
      { name: "description", content: "Browse curated products and manage inventory in one simple page." },
      { property: "og:title", content: "ShopEase — Shop & Manage Inventory" },
      { property: "og:description", content: "Browse curated products and manage inventory in one simple page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Product = { id: number; name: string; price: number; category: string; stock: number; image: string };

const u = (id: string) => `https://images.unsplash.com/${id}?w=600&q=70&auto=format&fit=crop`;
const SAMPLE: Product[] = [
  { id: 1, name: "Wireless Headphones", price: 129, category: "Electronics", stock: 12, image: u("photo-1505740420928-5e560c06d30e") },
  { id: 2, name: "Smart Watch", price: 199, category: "Electronics", stock: 3, image: u("photo-1523275335684-37898b6baf30") },
  { id: 3, name: "Running Sneakers", price: 89, category: "Fashion", stock: 20, image: u("photo-1542291026-7eec264c27ff") },
  { id: 4, name: "Classic Sunglasses", price: 59, category: "Fashion", stock: 0, image: u("photo-1572635196237-14b3f281503f") },
  { id: 5, name: "Ceramic Mug", price: 18, category: "Home", stock: 40, image: u("photo-1514228742587-6b1558fcca3d") },
  { id: 6, name: "Potted Plant", price: 32, category: "Home", stock: 4, image: u("photo-1485955900006-10f4d324d411") },
  { id: 7, name: "Leather Backpack", price: 149, category: "Fashion", stock: 8, image: u("photo-1553062407-98eeb64c6a62") },
  { id: 8, name: "Polaroid Camera", price: 110, category: "Electronics", stock: 6, image: u("photo-1526170375885-4d8ecf77b99f") },
];
const money = (n: number) => `$${n.toFixed(2)}`;
const empty = { name: "", price: 0, category: "Electronics", stock: 0, image: "" };

function Index() {
  const [products, setProducts] = useState<Product[]>(SAMPLE);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [tab, setTab] = useState<"shop" | "inventory">("shop");
  const [cartOpen, setCartOpen] = useState(false);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const addToCart = (id: number) => {
    const p = products.find((x) => x.id === id)!;
    setCart((c) => ((c[id] ?? 0) < p.stock ? { ...c, [id]: (c[id] ?? 0) + 1 } : c));
  };
  const setQty = (id: number, q: number) =>
    setCart((c) => {
      const n = { ...c };
      if (q <= 0) delete n[id];
      else n[id] = q;
      return n;
    });

  // keep cart consistent with inventory changes
  const syncedCart = useMemo(() => {
    const out: Record<number, number> = {};
    for (const [id, q] of Object.entries(cart)) {
      const p = products.find((x) => x.id === +id);
      if (p && p.stock > 0) out[+id] = Math.min(q, p.stock);
    }
    return out;
  }, [cart, products]);

  return (
    <div className="min-h-screen">
      <Toaster position="top-center" />
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <h1 className="text-2xl font-bold">Shop<span className="text-primary">Ease</span></h1>
          <div className="flex rounded-full bg-secondary p-1 text-sm font-semibold">
            {(["shop", "inventory"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 transition ${tab === t ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
                {t === "shop" ? "Storefront" : "Inventory"}
              </button>
            ))}
          </div>
          <button onClick={() => setCartOpen(true)} aria-label="Open cart" className="relative rounded-full p-2 hover:bg-secondary">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      {tab === "shop" ? (
        <Storefront products={products} onAdd={addToCart} cart={syncedCart} />
      ) : (
        <Inventory products={products} setProducts={setProducts} />
      )}

      {cartOpen && (
        <CartDrawer products={products} cart={syncedCart} setQty={setQty} onClose={() => setCartOpen(false)}
          onCheckout={() => {
            setProducts((ps) => ps.map((p) => ({ ...p, stock: p.stock - (syncedCart[p.id] ?? 0) })));
            setCart({});
            setCartOpen(false);
            toast.success("Order placed! Stock has been updated.");
          }} />
      )}
    </div>
  );
}

function Storefront({ products, onAdd, cart }: { products: Product[]; onAdd: (id: number) => void; cart: Record<number, number> }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const cats = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const list = products.filter((p) => (cat === "All" || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <main>
      <section className="relative overflow-hidden">
        <img src={hero} alt="Curated lifestyle products" width={1600} height={912} className="h-[360px] w-full object-cover md:h-[440px]" />
        <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-center px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/80">New season</p>
          <h2 className="mt-2 max-w-md text-4xl font-bold leading-tight text-primary-foreground md:text-6xl">Everyday things, made easy.</h2>
          <a href="#products" className="mt-6 w-fit rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90">Shop now</a>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${cat === c ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"}`}>{c}</button>
            ))}
          </div>
          <div className="relative md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…"
              className="w-full rounded-full border bg-card py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        {list.length === 0 && <p className="py-16 text-center text-muted-foreground">No products match your search.</p>}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => {
            const inCart = cart[p.id] ?? 0;
            const out = p.stock === 0;
            const maxed = inCart >= p.stock;
            return (
              <article key={p.id} className="group overflow-hidden rounded-2xl border bg-card transition hover:shadow-lg">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {p.stock > 0 && p.stock < 5 && (
                    <span className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-warning px-2.5 py-1 text-xs font-bold text-foreground shadow">
                      <AlertTriangle className="h-3 w-3" /> Low stock
                    </span>
                  )}
                  {out && (
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground shadow">Sold out</span>
                  )}
                  <img src={p.image} alt={p.name} loading="lazy" className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${out ? "opacity-50 grayscale" : ""}`} />
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                  <h3 className="font-sans font-semibold leading-snug">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{money(p.price)}</span>
                    <StockBadge stock={p.stock} />
                  </div>
                  <button disabled={out || maxed} onClick={() => onAdd(p.id)}
                    className="w-full rounded-full bg-primary py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground">
                    {out ? "Out of stock" : maxed ? "Max in cart" : "Add to Cart"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">Out of stock</span>;
  if (stock < 5) return <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs font-semibold text-foreground">Only {stock} left</span>;
  return <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">In stock</span>;
}

function CartDrawer({ products, cart, setQty, onClose, onCheckout }: {
  products: Product[]; cart: Record<number, number>; setQty: (id: number, q: number) => void; onClose: () => void; onCheckout: () => void;
}) {
  const items = products.filter((p) => (cart[p.id] ?? 0));
  const total = items.reduce((s, p) => s + p.price * (cart[p.id] ?? 0), 0);
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-2xl animate-in slide-in-from-right">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-xl font-bold">Your cart</h2>
          <button onClick={onClose} aria-label="Close cart" className="rounded-full p-1 hover:bg-secondary"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {items.length === 0 && <p className="py-20 text-center text-muted-foreground">Your cart is empty.</p>}
          {items.map((p) => (
            <div key={p.id} className="flex gap-3">
              <img src={p.image} alt={p.name} className="h-20 w-20 rounded-xl object-cover" />
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-2">
                  <p className="font-semibold">{p.name}</p>
                  <button onClick={() => setQty(p.id, 0)} aria-label="Remove" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-full border">
                    <button onClick={() => setQty(p.id, (cart[p.id] ?? 0) - 1)} className="p-1.5" aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-8 text-center text-sm font-semibold">{(cart[p.id] ?? 0)}</span>
                    <button disabled={(cart[p.id] ?? 0) >= p.stock} onClick={() => setQty(p.id, (cart[p.id] ?? 0) + 1)} className="p-1.5 disabled:opacity-30" aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <span className="font-bold">{money(p.price * (cart[p.id] ?? 0))}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3 border-t p-5">
          <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{money(total)}</span></div>
          <button disabled={!items.length} onClick={onCheckout}
            className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-40">Checkout</button>
        </div>
      </aside>
    </div>
  );
}

function Inventory({ products, setProducts }: { products: Product[]; setProducts: React.Dispatch<React.SetStateAction<Product[]>> }) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(empty);
  const [open, setOpen] = useState(false);
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const outCount = products.filter((p) => p.stock === 0).length;
  const lowCount = products.filter((p) => p.stock > 0 && p.stock < 5).length;

  const openForm = (p?: Product) => {
    setEditing(p ?? null);
    setForm(p ? { name: p.name, price: p.price, category: p.category, stock: p.stock, image: p.image } : empty);
    setOpen(true);
  };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const data = { ...form, price: Math.max(0, +form.price), stock: Math.max(0, Math.floor(+form.stock)), image: form.image || u("photo-1523275335684-37898b6baf30") };
    if (editing) setProducts((ps) => ps.map((p) => (p.id === editing.id ? { ...p, ...data } : p)));
    else setProducts((ps) => [...ps, { id: Math.max(0, ...ps.map((p) => p.id)) + 1, ...data }]);
    setOpen(false);
  };
  const setStock = (id: number, stock: number) => setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, stock: Math.max(0, stock) } : p)));

  const stats = [
    { label: "Total products", value: products.length, icon: Package },
    { label: "Total stock value", value: money(totalValue), icon: DollarSign },
    { label: "Out of stock", value: outCount, icon: PackageX },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Inventory</h2>
          <p className="text-muted-foreground">Changes appear instantly in the storefront.</p>
        </div>
        <button onClick={() => openForm()} className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-2xl border bg-card p-5">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary"><s.icon className="h-5 w-5" /></div>
            <div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div>
          </div>
        ))}
      </div>

      {lowCount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-warning/50 bg-warning/15 p-4 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
          <span><b>{lowCount}</b> product{lowCount > 1 ? "s are" : " is"} running low (under 5 units).</span>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-secondary text-left text-muted-foreground">
            <tr>{["Product", "Category", "Price", "Stock", "Value", "Status", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={`border-t ${p.stock > 0 && p.stock < 5 ? "bg-warning/10" : ""}`}>
                <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="font-semibold">{p.name}</span></div></td>
                <td className="px-4 py-3">{p.category}</td>
                <td className="px-4 py-3">{money(p.price)}</td>
                <td className="px-4 py-3">
                  <div className="flex w-fit items-center rounded-full border">
                    <button onClick={() => setStock(p.id, p.stock - 1)} className="p-1.5" aria-label="Decrease stock"><Minus className="h-3.5 w-3.5" /></button>
                    <input type="number" min={0} value={p.stock} onChange={(e) => setStock(p.id, Math.floor(+e.target.value || 0))}
                      className="w-12 bg-transparent text-center font-semibold outline-none [appearance:textfield]" />
                    <button onClick={() => setStock(p.id, p.stock + 1)} className="p-1.5" aria-label="Increase stock"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
                <td className="px-4 py-3">{money(p.price * p.stock)}</td>
                <td className="px-4 py-3"><StockBadge stock={p.stock} /></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openForm(p)} aria-label="Edit" className="rounded-lg p-2 hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => confirm(`Delete ${p.name}?`) && setProducts((ps) => ps.filter((x) => x.id !== p.id))} aria-label="Delete" className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <form onSubmit={save} className="relative w-full max-w-md space-y-4 rounded-2xl bg-background p-6 shadow-2xl">
            <h3 className="text-xl font-bold">{editing ? "Edit product" : "Add product"}</h3>
            {([["name", "Name", "text"], ["price", "Price ($)", "number"], ["stock", "Stock quantity", "number"], ["image", "Image URL (optional)", "url"]] as const).map(([k, label, type]) => (
              <label key={k} className="block text-sm font-medium">{label}
                <input type={type} required={k === "name"} min={type === "number" ? 0 : undefined} step={k === "price" ? "0.01" : undefined}
                  value={form[k]} onChange={(e) => setForm({ ...form, [k]: type === "number" ? +e.target.value : e.target.value })}
                  className="mt-1 w-full rounded-lg border bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
              </label>
            ))}
            <label className="block text-sm font-medium">Category
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-lg border bg-card px-3 py-2">
                {["Electronics", "Fashion", "Home"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border px-5 py-2 text-sm font-semibold hover:bg-secondary">Cancel</button>
              <button className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Save</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
