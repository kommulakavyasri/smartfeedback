import { collection, doc, getDocs, query, where, writeBatch } from "firebase/firestore";
import { db } from "../firebase/FireBaseConfig";

export const seedBVCECUsers = async () => {
  try {
    const batch = writeBatch(db);

    // 1. Find BVCEC College ID
    const q = query(collection(db, "colleges"), where("name", "==", "BVCEC"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, message: "BVCEC College not found." };
    }

    const collegeDoc = querySnapshot.docs[0];
    const collegeId = collegeDoc.id;

    // Data lists
    const facultyList = [
      { uid: "dummy-faculty-1", name: "Dr. K. Srinivas", email: "srinivas.k@bvcec.ac.in", role: "faculty", department: "Computer Science and Engineering", collegeId: collegeId, createdAt: new Date(), hasAuthAccount: false },
      { uid: "dummy-faculty-2", name: "Prof. P. Ramana", email: "ramana.p@bvcec.ac.in", role: "faculty", department: "Electronics and Communication Engineering", collegeId: collegeId, createdAt: new Date(), hasAuthAccount: false },
      { uid: "dummy-faculty-3", name: "Dr. M. Lakshmi", email: "lakshmi.m@bvcec.ac.in", role: "faculty", department: "Mechanical Engineering", collegeId: collegeId, createdAt: new Date(), hasAuthAccount: false }
    ];

    const studentList = [
      { uid: "dummy-student-1", name: "A. Venkata Rao", email: "student1@bvcec.ac.in", role: "student", branch: "Computer Science and Engineering", collegeId: collegeId, createdAt: new Date() },
      { uid: "dummy-student-2", name: "B. Sravani", email: "student2@bvcec.ac.in", role: "student", branch: "Computer Science and Engineering", collegeId: collegeId, createdAt: new Date() },
      { uid: "dummy-student-3", name: "C. Krishna", email: "student3@bvcec.ac.in", role: "student", branch: "Electronics and Communication Engineering", collegeId: collegeId, createdAt: new Date() },
      { uid: "dummy-student-4", name: "D. Akhil", email: "student4@bvcec.ac.in", role: "student", branch: "Mechanical Engineering", collegeId: collegeId, createdAt: new Date() },
      { uid: "dummy-student-5", name: "E. Bhavya", email: "student5@bvcec.ac.in", role: "student", branch: "Electrical and Electronics Engineering", collegeId: collegeId, createdAt: new Date() }
    ];

    // Add Users to Batch
    facultyList.forEach(fac => batch.set(doc(db, "users", fac.uid), fac));
    studentList.forEach(stu => batch.set(doc(db, "users", stu.uid), stu));

    // Admin
    const adminData = {
      uid: "bvcec-admin-1",
      name: "BVCEC Administrator",
      email: "admin@bvcec.ac.in",
      role: "admin",
      collegeId: collegeId,
      createdAt: new Date(),
      lastLogin: new Date(),
      isActive: true
    };
    batch.set(doc(db, "users", adminData.uid), adminData);

    // Feedback to Batch
    const feedbackList = [
      { studentId: "dummy-student-1", studentName: "A. Venkata Rao", facultyId: "dummy-faculty-1", facultyName: "Dr. K. Srinivas", collegeId: collegeId, subject: "Data Structures", category: "teaching", comment: "Excellent teaching.", points: 9, createdAt: new Date() },
      { studentId: "dummy-student-2", studentName: "B. Sravani", facultyId: "dummy-faculty-1", facultyName: "Dr. K. Srinivas", collegeId: collegeId, subject: "Data Structures", category: "communication", comment: "Approachable.", points: 7, createdAt: new Date() }
    ];
    feedbackList.forEach(fb => batch.set(doc(collection(db, "feedback")), fb));

    // Update College Stats in Batch
    batch.update(collegeDoc.ref, {
      facultyCount: facultyList.length,
      studentCount: studentList.length
    });

    // Commit all at once
    await batch.commit();

    return { success: true, message: `Successfully seeded faculty, students, and admin.` };
  } catch (error) {
    console.error("Seeding error:", error);
    return { success: false, message: error.message };
  }
};
