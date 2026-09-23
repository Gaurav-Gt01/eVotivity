/**
 * Robust Web3 Provider Resolution for Chrome & MetaMask
 */
export async function getMetaMaskProvider() {
  if (typeof window === 'undefined') return null;

  // 1. Direct window.ethereum check
  if (window.ethereum) {
    // Check if multiple providers are injected (e.g. Phantom + MetaMask)
    if (window.ethereum.providers?.length) {
      const mm = window.ethereum.providers.find((p) => p.isMetaMask);
      if (mm) return mm;
    }
    return window.ethereum;
  }

  // 2. Poll briefly (500ms) for delayed extension injection
  for (let i = 0; i < 5; i++) {
    await new Promise((res) => setTimeout(res, 100));
    if (window.ethereum) {
      if (window.ethereum.providers?.length) {
        const mm = window.ethereum.providers.find((p) => p.isMetaMask);
        if (mm) return mm;
      }
      return window.ethereum;
    }
  }

  return null;
}

export async function requestMetaMaskAccount() {
  const provider = await getMetaMaskProvider();
  if (!provider) {
    throw new Error(
      "MetaMask extension is not detected in window.ethereum. " +
      "If you have MetaMask installed in Chrome, please check: " +
      "1. Make sure extension permissions are set to 'On all sites'. " +
      "2. If using Incognito, enable 'Allow in Incognito' in Chrome Extensions. " +
      "3. Alternatively, you can enter your Sepolia wallet address manually below."
    );
  }

  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts authorized in MetaMask.");
  }
  return accounts[0];
}
