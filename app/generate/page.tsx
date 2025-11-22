import InputForm from '@/components/InputForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function GeneratePage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-foreground">Create Your Survey</h1>
                    <p className="mt-2 text-muted-foreground">Tell us about your goals, and we&apos;ll handle the rest.</p>
                </div>

                    <InputForm />
                </div>
            </main>
            <Footer />
        </div>
    );
}
