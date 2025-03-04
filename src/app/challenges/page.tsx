import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Challenges - ZombitX64",
  description: "Participate in AI challenges and competitions",
};

export default function ChallengesPage() {
  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">AI Challenges</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Image Classification Challenge</CardTitle>
            <CardDescription>
              Classify images of different types of malware.
            </CardDescription>
            <Badge variant="secondary">Beginner</Badge>
          </CardHeader>
          <CardContent>
            <p>Develop a model to accurately classify images of various malware families. Dataset includes ransomware, trojans, and worms.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Natural Language Processing Challenge</CardTitle>
            <CardDescription>
              Detect phishing attempts in emails.
            </CardDescription>
            <Badge variant="secondary">Intermediate</Badge>
          </CardHeader>
          <CardContent>
            <p>Build an NLP model to identify phishing attempts in a dataset of emails. Focus on identifying key phrases and patterns.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reinforcement Learning Challenge</CardTitle>
            <CardDescription>
              Train an agent to navigate a simulated network.
            </CardDescription>
            <Badge variant="secondary">Advanced</Badge>
          </CardHeader>
          <CardContent>
            <p>Use reinforcement learning to train an agent that can successfully navigate a simulated network, avoiding detection and reaching a target.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              More AI challenges are being prepared
            </CardDescription>
          </CardHeader>
          <CardContent>
            Get ready for exciting AI challenges, hackathons, and competitions. Compete with others and showcase your skills!
          </CardContent>
        </Card>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Why Participate?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Learn and Grow</CardTitle>
              <CardDescription>
                Enhance your AI development skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              Work on real-world problems and learn from the community.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Win Rewards</CardTitle>
              <CardDescription>
                Earn recognition and prizes
              </CardDescription>
            </CardHeader>
            <CardContent>
              Top performers will receive rewards and recognition from the community.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
