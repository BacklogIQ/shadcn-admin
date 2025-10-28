import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { IconBitbucket, IconGithub, IconGoogle } from '@/assets/brand-icons'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { supabase } from '@/lib/supabase'
import { syncUserToBackend } from '@/lib/api'

const formSchema = z
  .object({
    email: z.email({
      error: (iss) =>
        iss.input === '' ? 'Please enter your email' : undefined,
    }),
    password: z
      .string()
      .min(1, 'Please enter your password')
      .min(7, 'Password must be at least 7 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

interface SignUpFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function SignUpForm({
  className,
  redirectTo,
  ...props
}: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    const p = (async () => {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (error) throw error

      // Check if email confirmation is required
      if (signUpData.user && !signUpData.session) {
        return {
          message: 'Please check your email to confirm your account',
          user: signUpData.user,
        }
      }

      // If session exists, sync to backend
      if (signUpData.session) {
        try {
          await syncUserToBackend()
          console.log('User synced to backend successfully')
        } catch (syncError) {
          console.error('Failed to sync user to backend:', syncError)
        }
      }

      const targetPath = redirectTo || '/'
      navigate({ to: targetPath, replace: true })
      return signUpData
    })()

    toast.promise(p, {
      loading: 'Creating your account...',
      success: (data) => {
        setIsLoading(false)
        if ('message' in data) {
          return data.message
        }
        return `Welcome! Your account has been created.`
      },
      error: (err) => {
        setIsLoading(false)
        return err?.message || 'Sign up failed'
      },
    })
  }

  async function handleOAuthSignIn(provider: 'github' | 'google' | 'bitbucket') {
    setIsOAuthLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth-callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      setIsOAuthLoading(false)
      toast.error(error instanceof Error ? error.message : 'OAuth sign up failed')
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <UserPlus />}
          Create Account
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background text-muted-foreground px-2'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-3 gap-2'>
          <Button
            variant='outline'
            type='button'
            disabled={isLoading || isOAuthLoading}
            onClick={() => handleOAuthSignIn('github')}
          >
            <IconGithub className='h-4 w-4' />
            GitHub
          </Button>
          <Button
            variant='outline'
            type='button'
            disabled={isLoading || isOAuthLoading}
            onClick={() => handleOAuthSignIn('google')}
          >
            <IconGoogle className='h-4 w-4' />
            Google
          </Button>
          <Button
            variant='outline'
            type='button'
            disabled={isLoading || isOAuthLoading}
            onClick={() => handleOAuthSignIn('bitbucket')}
          >
            <IconBitbucket className='h-4 w-4' />
            Bitbucket
          </Button>
        </div>
      </form>
    </Form>
  )
}
