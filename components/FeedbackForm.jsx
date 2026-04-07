import { addDoc, collection } from "firebase/firestore";
import { db } from "../src/firebase/FireBaseConfig";
import { auth } from "../src/firebase/FireBaseConfig";
import { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";

const FACULTY_LIST = [
  { id: "prof-sarita", name: "Prof. Sarita Sharma" },
  { id: "prof-neha", name: "Prof. Neha Verma" },
  { id: "prof-rahul", name: "Prof. Rahul Patel" }
];

export default function FeedbackForm() {
  const [faculty, setFaculty] = useState(FACULTY_LIST[0].id);
  const [category, setCategory] = useState("teaching");
  const [points, setPoints] = useState(8);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const getSmartSuggestion = (rating, cat) => {
    if (rating >= 8) {
      return cat === "teaching" ? "Great teaching! Keep up the excellent work." :
             cat === "content" ? "Course content is well-structured and engaging." :
             "Communication is clear and effective.";
    } else if (rating >= 5) {
      return cat === "teaching" ? "Good teaching, but could be more interactive." :
             cat === "content" ? "Content is adequate, but could be more comprehensive." :
             "Communication is okay, but could be improved.";
    } else {
      return cat === "teaching" ? "Teaching needs improvement in engagement and clarity." :
             cat === "content" ? "Course content requires more depth and relevance." :
             "Communication needs significant improvement.";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const selectedFaculty = FACULTY_LIST.find((item) => item.id === faculty)?.name || "Unknown Faculty";
      await addDoc(collection(db, "feedback"), {
        faculty: selectedFaculty,
        facultyId: faculty,
        category,
        points,
        text: text.trim(),
        userId: auth.currentUser?.uid,
        createdAt: new Date()
      });
      setText("");
      setPoints(8);
      setCategory("teaching");
      setStatusMessage("Smart feedback submitted successfully!");
      setTimeout(() => setStatusMessage(""), 5000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Error submitting feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h5 className="mb-3">Submit Your Feedback</h5>

      {statusMessage && (
        <Alert variant="success" className="mb-3">
          {statusMessage}
        </Alert>
      )}

      <Form onSubmit={submit}>
        <Form.Group className="mb-3">
          <Form.Label>Select Faculty</Form.Label>
          <Form.Select value={faculty} onChange={(e) => setFaculty(e.target.value)}>
            {FACULTY_LIST.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Feedback Category</Form.Label>
          <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="teaching">Teaching Quality</option>
            <option value="content">Course Content</option>
            <option value="communication">Communication</option>
            <option value="support">Student Support</option>
            <option value="other">Other</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Rating Points</Form.Label>
          <Form.Range
            min={1}
            max={10}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
          />
          <div className="text-end text-muted">Points: {points}</div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Control
            as="textarea"
            rows={4}
            placeholder="Share your thoughts, suggestions, or concerns..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <Form.Text className="text-muted">
            Select a faculty member, choose a category, assign a score, and share your feedback.
          </Form.Text>
        </Form.Group>

        <div className="mb-3 p-3 bg-light rounded">
          <strong>Smart Suggestion:</strong> {getSmartSuggestion(points, category)}
        </div>

        <Button
          variant="primary"
          type="submit"
          disabled={loading || !text.trim()}
          className="w-100"
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Submitting...
            </>
          ) : (
            "Submit Feedback"
          )}
        </Button>
      </Form>
    </div>
  );
}