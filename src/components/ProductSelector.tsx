'use client';

import { useDashboard } from './DashboardContext';

interface ProductSelectorProps {
  value: string;
  onChange: (product: any) => void;
  disabled?: boolean;
}

export default function ProductSelector({ value, onChange, disabled }: ProductSelectorProps) {
  const { products } = useDashboard();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const product = products.find(p => p.id === selectedId);
    if (product) {
      onChange(product);
    }
  };

  return (
    <div className="product-selector">
      <label>Product Type</label>
      <div className="select-wrapper">
        <select 
          value={value} 
          onChange={handleChange} 
          disabled={disabled}
        >
          <option value="" disabled>Select Cement Type...</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} (₦{Number(p.default_price).toLocaleString()})
            </option>
          ))}
        </select>
      </div>
      
      <style jsx>{`
        .product-selector { width: 100%; display: block; margin-bottom: 0.5rem; }
        .product-selector label { display: block; font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 4px; }
        
        .select-wrapper { position: relative; width: 100%; }
        .select-wrapper::after {
          content: '▼';
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 8px;
          color: #666;
          pointer-events: none;
        }

        select {
          width: 100%;
          background: #0a0a0a;
          border: 1px solid #222;
          border-radius: 4px;
          color: #fff;
          padding: 8px 10px;
          font-size: 14px;
          outline: none;
          cursor: pointer;
          appearance: none;
          display: block;
        }
        
        select:focus { border-color: #EF4444; }
        select:disabled { opacity: 0.5; cursor: not-allowed; }
        
        option { background: #111; }
      `}</style>
    </div>
  );
}
