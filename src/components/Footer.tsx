export function Footer() {
  return (
    <footer className="mt-16 border-t border-amical-gold/30 bg-amical-dark py-10">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 text-sm text-gray-300 md:grid-cols-3">
        <div>
          <p className="text-base font-bold text-amical-gold">Amical Pay</p>
          <p className="mt-2">Free Fire diamonds top-up platform.</p>
        </div>
        <div>
          <p className="font-semibold text-white">Links</p>
          <ul className="mt-2 space-y-1">
            <li>FAQ</li>
            <li>Support</li>
            <li>Terms</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Social</p>
          <ul className="mt-2 space-y-1">
            <li>Instagram</li>
            <li>TikTok</li>
            <li>YouTube</li>
          </ul>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-gray-500">© 2026 Amical Pay. All rights reserved.</p>
    </footer>
  )
}
