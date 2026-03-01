const SNAP_SCRIPT_URLS = {
  production: "https://app.midtrans.com/snap/snap.js",
  sandbox: "https://app.sandbox.midtrans.com/snap/snap.js",
};

type SnapResult = Record<string, unknown>;

type SnapPayOptions = {
  onSuccess?: (result: SnapResult) => void;
  onPending?: (result: SnapResult) => void;
  onError?: (result: SnapResult) => void;
  onClose?: () => void;
};

type SnapPayResult =
  | { status: "success"; result: SnapResult }
  | { status: "pending"; result: SnapResult };

type SnapNamespace = {
  pay(token: string, options: SnapPayOptions): void;
};

declare global {
  interface Window {
    snap?: SnapNamespace;
  }
}

let snapLoaderPromise: Promise<SnapNamespace> | null = null;

function resolveSnapEnv() {
  const env = (process.env.NEXT_PUBLIC_MIDTRANS_ENV || "sandbox").toLowerCase();
  return env === "production" ? "production" : "sandbox";
}

export async function loadMidtransSnap(clientKey?: string): Promise<SnapNamespace> {
  if (typeof window === "undefined") {
    throw new Error("Midtrans Snap can only be run on the client side");
  }
  if (window.snap) {
    return window.snap;
  }

  const resolvedClientKey = clientKey ?? process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
  if (!resolvedClientKey) {
    throw new Error("Client key not found.");
  }

  if (!snapLoaderPromise) {
    snapLoaderPromise = new Promise<SnapNamespace>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SNAP_SCRIPT_URLS[resolveSnapEnv()];
      script.async = true;
      script.dataset.clientKey = resolvedClientKey;
      script.onload = () => {
        if (window.snap) {
          resolve(window.snap);
          return;
        }
        reject(new Error("Midtrans Snap failed to load."));
      };
      script.onerror = () => {
        reject(new Error("Unable to load Midtrans Snap script."));
      };
      document.body.appendChild(script);
    }).catch((error) => {
      snapLoaderPromise = null;
      throw error;
    });
  }

  return snapLoaderPromise;
}

export async function payWithMidtransSnap(
  token: string,
  options?: SnapPayOptions
): Promise<SnapPayResult> {
  if (!token) {
    throw new Error("Token Midtrans Snap not available.");
  }
  const snap = await loadMidtransSnap();

  return new Promise<SnapPayResult>((resolve, reject) => {
    snap.pay(token, {
      onSuccess: (result) => {
        options?.onSuccess?.(result);
        resolve({ status: "success", result });
      },
      onPending: (result) => {
        options?.onPending?.(result);
        resolve({ status: "pending", result });
      },
      onError: (result) => {
        options?.onError?.(result);
        reject(
          new Error(
            typeof result?.toString === "function"
              ? result.toString()
              : "Midtrans transaction failed."
          )
        );  
      },
      onClose: () => {
        options?.onClose?.();
        reject(new Error("Midtrans popup closes before payment is complete."));
      },
    });
  });
}
