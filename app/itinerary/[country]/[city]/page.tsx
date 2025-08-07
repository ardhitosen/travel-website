import React from "react";
import ItineraryClient from "./ItineraryClient";

interface PageProps {
  params: Promise<{ country: string; city: string }>;
}

const ItineraryPage = async ({ params }: PageProps) => {
      const resolvedParams = await params;
  
  return <ItineraryClient params={resolvedParams} />;
};

export default ItineraryPage; 