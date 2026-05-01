import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

interface OtpForm {
    code: string;
}

interface OtpProps {
    status?: string;
}

export default function VerifyOtp({ status }: OtpProps) {
    const { data, setData, post, processing, errors, reset } = useForm<OtpForm>({
        code: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('otp.store'), {
            onFinish: () => reset('code'),
        });
    };

    return (
        <AuthLayout title="Verify one-time code" description="Enter the 6-digit code sent to your email.">
            <Head title="Verify OTP" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-2">
                    <Label htmlFor="code">One-time code</Label>
                    <Input
                        id="code"
                        type="text"
                        required
                        maxLength={6}
                        autoFocus
                        value={data.code}
                        onChange={(event) => setData('code', event.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                    />
                    <InputError message={errors.code} />
                </div>
                <Button type="submit" className="mt-4 w-full" disabled={processing}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Verify and continue
                </Button>
            </form>
            {status && <div className="mt-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
