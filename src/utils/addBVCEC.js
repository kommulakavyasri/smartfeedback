// Script to add BVCEC college to Firestore database
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "../firebase/FireBaseConfig";

// Function to add BVCEC college
export const addBVCECCollege = async () => {
  try {
    const collegeData = {
      name: "BVCEC",
      fullName: "Bonam Venkata Chalamayya Engineering College",
      location: "Odalarevu, Dr. B.R. Ambedkar Konaseema District, Andhra Pradesh",
      description: "BVCEC is a premier engineering institution offering quality education in various engineering disciplines with state-of-the-art facilities and experienced faculty.",
      facultyCount: 0,
      studentCount: 0,
      establishedYear: 1997,
      affiliatedTo: "JNTU Kakinada",
      website: "https://bvcec.ac.in",
      contactEmail: "info@bvcec.ac.in",
      contactPhone: "+91-8812-234567",
      address: "Narsapur, West Godavari District, Andhra Pradesh - 534275",
      departments: [
        "Computer Science and Engineering",
        "Electronics and Communication Engineering",
        "Electrical and Electronics Engineering",
        "Mechanical Engineering",
        "Civil Engineering"
      ],
      facilities: [
        "Digital Library",
        "Advanced Laboratories",
        "Sports Complex",
        "Hostel Facilities",
        "Transportation",
        "Placement Cell"
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    // Add to Firestore
    const collegeRef = doc(collection(db, "colleges"));
    await setDoc(collegeRef, collegeData);

    console.log("BVCEC college added successfully with ID:", collegeRef.id);
    return {
      success: true,
      collegeId: collegeRef.id,
      message: "BVCEC college added successfully"
    };
  } catch (error) {
    console.error("Error adding BVCEC college:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to add BVCEC college"
    };
  }
};

// Function to execute the script
export const executeAddBVCEC = async () => {
  console.log("Adding BVCEC college to Firestore...");
  const result = await addBVCECCollege();
  
  if (result.success) {
    console.log("Success:", result.message);
    console.log("College ID:", result.collegeId);
  } else {
    console.error("Error:", result.message);
    console.error("Details:", result.error);
  }
  
  return result;
};

// Export for direct usage
export default { addBVCECCollege, executeAddBVCEC };
