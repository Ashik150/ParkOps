import Brand from "./Brand";

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <Brand />
      <span className="spinner spinner--large" aria-label="Loading" />
    </div>
  );
}
