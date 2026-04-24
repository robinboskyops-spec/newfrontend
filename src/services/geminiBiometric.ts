import { User } from "../types";

/**
 * Identifies an employee from a camera snapshot using backend-facilitated AI vision.
 * Returns the matched User object or null if no match found.
 */
export const predictEmployeeIdentity = async (
  capturedDataUrl: string, 
  employees: User[]
): Promise<User | null> => {
  try {
    const validGallery = employees.filter((emp: any) => emp.faceEnrolled && emp.faceData && emp.faceData.startsWith('data:image'));
      
    if (validGallery.length === 0) {
      console.error("[Biometric] Prediction aborted: No enrolled users found in gallery.");
      return null;
    }

    console.log(`[Biometric] Requesting backend matching against ${validGallery.length} enrolled signatures...`);

    const API_URL = import.meta.env.DEV ? "" : "https://newapp-p81d.onrender.com";
    const response = await fetch(`${API_URL}/api/biometric/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        capturedDataUrl,
        gallery: validGallery.map(e => ({ id: e.id, faceData: e.faceData }))
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.statusText}`);
    }

    const match = await response.json();
    console.log(`[Biometric] Raw Match Result: ID=${match.id}, Confidence=${match.confidence}, Reason=${match.reason || 'N/A'}`);
    
    // We now accept matches at 0.70+ for production robustness
    if (match.id && match.id !== 'none' && match.id !== 'low_confidence') {
        let finalId = match.id;
        if (typeof finalId === 'string' && finalId.startsWith("USER_ID_")) {
            finalId = finalId.replace("USER_ID_", "");
        }
        const matchedEmp = employees.find(e => e.id === String(finalId));
        return matchedEmp || null;
    }

    if (match.id === 'low_confidence') {
      console.warn("[Biometric] Match rejected due to low confidence:", match.confidence);
    }

    return null;

  } catch (error: any) {
    console.error("Biometric Prediction Error (Backend Link):", error);
    return null;
  }
};
