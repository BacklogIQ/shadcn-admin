import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
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

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(7, 'Password must be at least 7 characters long'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    const p = (async () => {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (error) throw error

      // Sync user to backend
      try {
        await syncUserToBackend()
        console.log('User synced to backend successfully')
      } catch (syncError) {
        // Don't fail login if backend sync fails, just log it
        console.error('Failed to sync user to backend:', syncError)
      }

      // success: navigate to redirect or home
      const targetPath = redirectTo || '/'
      navigate({ to: targetPath, replace: true })
      return signInData
    })()

    toast.promise(p, {
      loading: 'Signing in...',
      success: () => {
        setIsLoading(false)
        return `Welcome back, ${data.email}!`
      },
      error: (err) => {
        setIsLoading(false)
        return err?.message || 'Sign in failed'
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
      toast.error(error instanceof Error ? error.message : 'OAuth sign in failed')
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
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
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
