import { useRef, useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { Link,useNavigate } from "react-router-dom";
import supabase from "../../api/CreateSupabaseClient.tsx";

const Register = () => {
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate=useNavigate();

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (
      !passwordRef.current?.value ||
      !emailRef.current?.value ||
      !confirmPasswordRef.current?.value
    ) {
      setErrorMsg("Please fill all the fields");
      return;
    }
    if (passwordRef.current.value !== confirmPasswordRef.current.value) {
      setErrorMsg("Passwords doesn't match");
      return;
    }
    setErrorMsg("/login");
    setLoading(true);
    supabase.auth.signUp({
      email: emailRef.current.value,
      password: passwordRef.current.value,
    }).then((res) => {
      console.log(res.data)
      if(res.error){
        console.log(res.error.message)
        setErrorMsg(res.error.message);
        setLoading(false);
        return;
      }else{
        if(res.data.user){
          insertEmptyProfile(res.data.user.id)
          navigate("/");
          setMsg("Registration Successful");
        }
      }
    })
    setLoading(false);
  };
  const insertEmptyProfile=async(userId:string|undefined)=>{
    const { data, error } = await supabase.from("profiles").insert([{ "user_id": userId }]);
    if (error) {
      console.log(error);
      return;
    }
    console.log(data);
  }
  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Register</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required />
            </Form.Group>
            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" ref={passwordRef} required />
            </Form.Group>
            <Form.Group id="confirm-password">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control type="password" ref={confirmPasswordRef} required />
            </Form.Group>
            {errorMsg && (
              <Alert
                variant="danger"
                onClose={() => setErrorMsg("")}
                dismissible
              >
                {errorMsg}
              </Alert>
            )}
            {msg && (
              <Alert variant="success" onClose={() => setMsg("")} dismissible>
                {msg}
              </Alert>
            )}
            <div className="text-center mt-2">
              <Button disabled={loading} type="submit" className="w-50">
                Register
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Already a User?{" "}
        <Link to={"/login"} state={{ from: "/register" }}>
          Login
        </Link>
      </div>
    </>
  );
};

export default Register;
