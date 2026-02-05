/**
 * Cart Merge API
 * POST /api/cart/merge
 * Merges visitor cart into authenticated user's cart
 */

import type { APIRoute } from 'astro';
import { createServerSupabase, type CartItemDB } from '@/lib/supabase';

export const POST: APIRoute = async ({ cookies, locals }) => {
    try {
        const supabase = createServerSupabase(cookies);

        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Not authenticated' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Get visitor ID from cookie
        const visitorId = locals.visitorId;

        if (!visitorId) {
            return new Response(JSON.stringify({ success: true, message: 'No visitor cart to merge' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Get visitor cart
        const { data: visitorCart } = await supabase
            .from('carts')
            .select('items')
            .eq('visitor_id', visitorId)
            .is('user_id', null)
            .single();

        // Get user cart (may not exist yet)
        const { data: userCart } = await supabase
            .from('carts')
            .select('id, items')
            .eq('user_id', user.id)
            .single();

        const visitorItems: CartItemDB[] = visitorCart?.items || [];
        const userItems: CartItemDB[] = userCart?.items || [];

        if (visitorItems.length === 0) {
            // No visitor items to merge
            // But associate the visitor cart with the user if exists
            await supabase
                .from('carts')
                .update({ user_id: user.id })
                .eq('visitor_id', visitorId);

            return new Response(JSON.stringify({
                success: true,
                message: 'Cart associated with user',
                items: userItems,
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Merge items: visitor items take precedence, add unique user items
        const mergedItems = [...visitorItems];

        for (const userItem of userItems) {
            const existingIndex = mergedItems.findIndex(item => item.sku === userItem.sku);
            if (existingIndex === -1) {
                // Item doesn't exist in visitor cart, add it
                mergedItems.push(userItem);
            } else {
                // Item exists, take the higher quantity
                mergedItems[existingIndex].quantity = Math.max(
                    mergedItems[existingIndex].quantity,
                    userItem.quantity
                );
            }
        }

        if (userCart) {
            // Update existing user cart with merged items
            await supabase
                .from('carts')
                .update({ items: mergedItems })
                .eq('id', userCart.id);

            // Delete the visitor cart
            await supabase
                .from('carts')
                .delete()
                .eq('visitor_id', visitorId)
                .is('user_id', null);
        } else {
            // No user cart exists, convert visitor cart to user cart
            await supabase
                .from('carts')
                .update({
                    user_id: user.id,
                    items: mergedItems,
                })
                .eq('visitor_id', visitorId);
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Carts merged successfully',
            items: mergedItems,
            merged_count: visitorItems.length,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Cart merge error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to merge carts',
            details: error instanceof Error ? error.message : 'Unknown error',
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
