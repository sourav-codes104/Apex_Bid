import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { usePropertyStore } from "@/stores/propertyStore";
import { useAuthStore } from "@/stores/authStore";
import StartAuctionForm from "@/components/auction/StartAuctionForm";

const PropertyDetails = () => {
  const { id } = useParams();
  const { currentProperty, fetchPropertyById, isLoading } = usePropertyStore();
  const user = useAuthStore((s) => s.user);

  const [showAuctionForm, setShowAuctionForm] = useState(false);

  useEffect(() => {
    if (id) fetchPropertyById(id);
  }, [id]);

  if (isLoading || !currentProperty)
    return (
      <Layout>
        <div className="p-10 text-center">Loading property...</div>
      </Layout>
    );

  const isOwner = user?.id === currentProperty.owner_id;

  return (
    <Layout>
      <div className="container py-10">
        {/* TITLE */}
        <h1 className="text-3xl font-bold mb-6">{currentProperty.title}</h1>

        {/* IMAGE */}
        <img
          src={currentProperty.image_url}
          alt={currentProperty.title}
          className="w-full max-w-2xl rounded-lg shadow"
        />

        {/* PROPERTY INFO */}
        <div className="mt-6 text-lg">
          <p>
            <strong>Price:</strong> ₹ {currentProperty.price}
          </p>
          <p>
            <strong>Location:</strong> {currentProperty.location}
          </p>
          <p className="mt-4">{currentProperty.description}</p>
        </div>

        {/* --------------------------- */}
        {/* START AUCTION BUTTON (OWNER ONLY) */}
        {/* --------------------------- */}
        {isOwner && (
          <div className="mt-8">
            <button
              onClick={() => setShowAuctionForm(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition"
            >
              Start Auction
            </button>
          </div>
        )}

        {/* --------------------------- */}
        {/* MODAL */}
        {/* --------------------------- */}
        {showAuctionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <StartAuctionForm
              propertyId={currentProperty.id}
              onClose={() => setShowAuctionForm(false)}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PropertyDetails;
