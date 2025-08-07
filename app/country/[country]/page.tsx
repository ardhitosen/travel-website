import React from "react";
import CountryClient from "./CountryClient";

interface PageProps {
  params: Promise<{ country: string }>;
}

const CountryPage = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  
  return <CountryClient params={resolvedParams} />;
};

export default CountryPage; 