import { useRouter } from "next/router";
import React from "react";
import { Email } from "../components/email";
import { emails } from "../test-emails";

interface Props {
  emailName: string;
}

const SingleEmail: React.FC = () => {
  const router = useRouter();
  const { emailName } = router.query as Record<string, string>;
  const body = (emails as Record<string, string>)[emailName] ?? "Not found";

  return (
    <div className="emails">
      <Email name={emailName} body={body} />

      <style jsx>{`
        .emails {
          padding: 2rem;
          height: 100%;
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default SingleEmail;
