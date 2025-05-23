import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyJwtToken, getUserById, updateUserPrefs, createSlug } from '@/lib/auth-server';
import { Client, Account } from 'appwrite';

// Schema for profile update validation
const profileUpdateSchema = z.object({
  name: z.string().min(1, { message: 'Název vinařství je povinný' }),
  email: z.string().email({ message: 'Zadejte platný email' }),
  slug: z.string().min(1, { message: 'Slug je povinný' })
    .regex(/^[a-z0-9-]+$/, { message: 'Slug může obsahovat pouze malá písmena, číslice a pomlčky' }),
  updateField: z.enum(['name', 'email', 'slug', 'all']), // Specify which field to update
});

export async function POST(request: NextRequest) {
  try {
    // Get the JWT token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = profileUpdateSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { message: 'Neplatné údaje', errors: result.error.format() },
        { status: 400 }
      );
    }
    
    const { name, email, slug, updateField } = result.data;
    
    try {
      // Verify JWT token
      const decoded = verifyJwtToken(token);
      
      // Get user by ID for validation
      const user = await getUserById(decoded.userId);
      
      // Create client for admin operations
      const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_PROJECT_ID || 'vinarstviqr');
      
      // Set API key for admin operations
      if (process.env.APPWRITE_KEY) {
        // Use type assertion to avoid TypeScript errors
        const adminClient = client as any;
        if (typeof adminClient.setKey === 'function') {
          adminClient.setKey(process.env.APPWRITE_KEY);
        }
      }
      
      // Update based on the specified field
      let nameUpdated = false;
      let slugUpdated = false;
      let nameUpdateTried = false;
      
      // Try to update name directly first if requested
      if (updateField === 'name' || updateField === 'all') {
        nameUpdateTried = true;
        
        try {
          // Use direct API call to update the user name
          const updateResponse = await fetch(`${process.env.APPWRITE_ENDPOINT}/users/${user.$id}/name`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'vinarstviqr',
              'X-Appwrite-Key': process.env.APPWRITE_KEY || '',
            },
            body: JSON.stringify({ 
              name: name 
            }),
          });
          
          if (updateResponse.ok) {
            console.log('Name updated successfully via direct API call');
            nameUpdated = true;
          } else {
            const errorText = await updateResponse.text();
            console.error(`Failed to update name directly: ${updateResponse.status}`, errorText);
            // Will fall back to preferences method
          }
        } catch (directUpdateError) {
          console.error('Error updating name directly:', directUpdateError);
          // Will fall back to preferences method
        }
      }
      
      // Update slug or store name in preferences as backup if direct update failed
      if ((updateField === 'slug' || updateField === 'all') || 
          (nameUpdateTried && !nameUpdated)) {
        
        const prefsToUpdate: Record<string, any> = {};
        
        // Add slug to update if needed
        if (updateField === 'slug' || updateField === 'all') {
          prefsToUpdate.slug = slug;
        }
        
        // Add name to preferences if direct update failed
        if (nameUpdateTried && !nameUpdated) {
          prefsToUpdate.displayName = name;
        }
        
        // Only update if we have something to update
        if (Object.keys(prefsToUpdate).length > 0) {
          try {
            await updateUserPrefs(prefsToUpdate, user.$id);
            
            console.log('Preferences updated successfully');
            
            if (prefsToUpdate.slug) {
              slugUpdated = true;
            }
            
            if (prefsToUpdate.displayName) {
              nameUpdated = true;
            }
          } catch (prefsError) {
            console.error('Error updating preferences:', prefsError);
            
            if (updateField === 'slug' && prefsToUpdate.slug) {
              throw new Error('Aktualizace slugu selhala');
            }
            
            if (updateField === 'name' && prefsToUpdate.displayName) {
              throw new Error('Aktualizace jména selhala');
            }
          }
        }
      }
      
      // Get the updated user to ensure we return the latest data
      const updatedUser = await getUserById(decoded.userId);
      
      // Determine the name to use in the response
      const responseName = nameUpdated ? name : (updatedUser.prefs?.displayName || updatedUser.name);
      
      // Determine the slug to use in the response
      const responseSlug = slugUpdated ? slug : (updatedUser.prefs?.slug || createSlug(updatedUser.name));
      
      // Prepare response message based on what was updated
      let message = '';
      if (nameUpdated && slugUpdated) {
        message = 'Profil byl úspěšně aktualizován';
      } else if (nameUpdated) {
        message = 'Jméno bylo úspěšně aktualizováno';
      } else if (slugUpdated) {
        message = 'Slug byl úspěšně aktualizován';
      } else {
        message = 'Žádné změny nebyly provedeny';
      }
      
      // Return updated user information
      return NextResponse.json({ 
        message: message,
        user: {
          id: updatedUser.$id,
          name: responseName,
          email: updatedUser.email,
          slug: responseSlug,
          hasCustomQRPrefs: !!updatedUser.prefs?.qrPresets,
          prefsLastUpdated: updatedUser.prefs?.$updatedAt || null
        }
      });
    } catch (tokenError) {
      console.error('Token error:', tokenError);
      return NextResponse.json(
        { message: 'Neplatný token nebo vypršela platnost přihlášení' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Aktualizace profilu selhala' },
      { status: 500 }
    );
  }
}