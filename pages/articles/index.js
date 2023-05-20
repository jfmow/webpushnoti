import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Articles() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, []);

  return <div>Redirecting to the homepage...</div>;
}
