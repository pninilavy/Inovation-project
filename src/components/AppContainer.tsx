import React from "react";

export default function AppContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
   <div className="min-h-[93vh] bg-white rounded-3xl shadow-lg flex flex-col px-2 py-1.5">
  {children}
</div>

  );
}
