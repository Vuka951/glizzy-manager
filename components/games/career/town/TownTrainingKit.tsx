// The second assistant's kit outside the training center: a crate of practice
// glizzies at the foot of the hall window and two cones under the cup banner
export default function TownTrainingKit() {
  return (
    <g>
      <ellipse cx="117" cy="148" rx="11" ry="1.6" className="fill-black opacity-30" />
      <rect x="107" y="136" width="20" height="12" rx="1" className="fill-[#8a5a32]" />
      <path d="M107 140.5h20M107 144.5h20" className="stroke-[#6b4423]" strokeWidth="0.8" />
      <path d="M113.6 136v12M120.4 136v12" className="stroke-[#6b4423]" strokeWidth="0.8" />
      <rect x="108" y="132" width="9" height="4.4" rx="2.2" className="fill-[#e0a458]" />
      <rect x="108.6" y="132.6" width="7.8" height="2.8" rx="1.4" className="fill-[#c2412d]" />
      <rect x="116.6" y="131" width="9" height="4.4" rx="2.2" className="fill-[#e0a458]" />
      <rect x="117.2" y="131.6" width="7.8" height="2.8" rx="1.4" className="fill-[#c2412d]" />
      <rect x="112" y="128.6" width="9" height="4.4" rx="2.2" className="fill-[#e0a458]" />
      <rect x="112.6" y="129.2" width="7.8" height="2.8" rx="1.4" className="fill-[#c2412d]" />
      <path
        d="M114 130.6l1.2.8 1.2-.8 1.2.8 1.2-.8 1.2.8"
        className="fill-none stroke-yellow-400"
        strokeWidth="0.6"
        strokeLinecap="round"
      />

      {[139, 151].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="148" rx="5" ry="1.2" className="fill-black opacity-30" />
          <rect x={x - 4.6} y="146" width="9.2" height="2" rx="0.6" className="fill-[#c2410c]" />
          <path d={`M${x - 3.2} 146.4L${x - 0.9} 136h1.8l2.3 10.4z`} className="fill-[#f97316]" />
          <path
            d={`M${x - 2.1} 141.6h4.2M${x - 1.5} 138.8h3`}
            className="stroke-slate-50"
            strokeWidth="1.1"
          />
        </g>
      ))}
    </g>
  );
}
