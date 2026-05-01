import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';

export default function AdminOtp() {
    const { data, setData, post, processing, errors } = useForm({ otp: '' });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/auth/verify-otp');
    };

    return (
        <AuthLayout title="Verify OTP" description="Enter the 6-digit passcode sent to your email.">
            <Head title="Verify OTP" />
            <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="otp">One-time passcode</Label>
                    <Input id="otp" inputMode="numeric" maxLength={6} value={data.otp} onChange={(e) => setData('otp', e.target.value)} />
                    <InputError message={errors.otp} />
                </div>
                <Button type="submit" className="w-full" disabled={processing}>Sign in</Button>
            </form>
        </AuthLayout>
    );
}
