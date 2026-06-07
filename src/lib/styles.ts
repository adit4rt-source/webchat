// Reusable Tailwind class strings (replaces @layer components)
export const styles = {
  card: "bg-dark-800 border border-dark-600 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-accent-primary/30",
  cardHighlight: "bg-dark-800 border border-accent-primary/20 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-accent-primary/50 hover:shadow-accent-primary/5",
  statCard: "bg-dark-800 border border-dark-600 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-accent-primary/30 relative overflow-hidden",
  btnPrimary: "px-4 py-2 bg-accent-primary hover:bg-accent-secondary text-white font-medium rounded-lg transition-all duration-200 shadow-lg disabled:opacity-50",
  btnDanger: "px-4 py-2 bg-accent-danger hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50",
  inputDark: "w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary transition-colors",
  sidebarLink: "flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-all duration-200",
  sidebarLinkActive: "flex items-center gap-3 px-4 py-3 rounded-lg text-white bg-dark-600 border-l-2 border-accent-primary transition-all duration-200",
};
