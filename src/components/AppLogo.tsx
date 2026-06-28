export default function AppLogo({ className = "" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="#FFF0E4" 
      stroke="#007979" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="4" />
      <path d="M8 8h8" stroke="#24B1B1" />
      <path d="M8 12h8" stroke="#24B1B1" />
      <path d="M8 16h5" stroke="#24B1B1" />
    </svg>
  )
}
