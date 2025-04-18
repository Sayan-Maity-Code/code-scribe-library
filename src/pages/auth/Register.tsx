import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6),
  role: z.enum(["member", "admin"], {
    required_error: "Please select a role",
  }),
  adminCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "member",
      adminCode: "",
    },
    mode: "onBlur",
  });
  
  const watchRole = form.watch("role");
  
  if (watchRole === "admin" && !showAdminCode) {
    setShowAdminCode(true);
  } else if (watchRole !== "admin" && showAdminCode) {
    setShowAdminCode(false);
  }

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      // Verify admin code if registering as admin
      if (values.role === "admin") {
        if (!values.adminCode) {
          toast({
            title: "Admin code required",
            description: "Please enter the admin code to register as an admin",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const { data: adminCodeData, error: adminCodeError } = await supabase
          .from("admin_codes")
          .select("*")
          .eq("code", values.adminCode)
          .eq("is_used", false)
          .single();

        if (adminCodeError || !adminCodeData) {
          toast({
            title: "Invalid admin code",
            description: "The admin code is invalid or has already been used",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }
      
      // Register the user
      const { error: signUpError } = await signUp(
        values.email,
        values.password,
        values.role,
        values.fullName
      );

      if (signUpError) throw signUpError;

      // If registration successful and admin role, mark the code as used
      if (values.role === "admin" && values.adminCode) {
        await supabase
          .from("admin_codes")
          .update({
            is_used: true,
            used_at: new Date().toISOString(),
          })
          .eq("code", values.adminCode);
      }

      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account.",
      });
      
      navigate("/login");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Create an Account</h1>
        <p className="text-muted-foreground mt-2">Sign up to get started</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="example@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Account Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="member" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Member</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="admin" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Admin</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {showAdminCode && (
            <FormField
              control={form.control}
              name="adminCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter admin code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>
      </Form>

      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};
