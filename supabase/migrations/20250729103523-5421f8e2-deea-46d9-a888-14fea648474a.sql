-- Script pentru a deduce retroactiv costurile pentru conversațiile care nu au fost procesate
-- Acest script va calcula costurile și va deduce din sold pentru apelurile care au cost > 0 dar nu au fost scăzute

DO $$
DECLARE
    conversation RECORD;
    calculated_cost NUMERIC;
    cost_per_minute CONSTANT NUMERIC := 0.15;
BEGIN
    -- Iterează prin toate conversațiile din conversation_analytics_cache care au costuri > 0
    FOR conversation IN 
        SELECT DISTINCT user_id, conversation_id, duration_seconds, cost_credits, call_date
        FROM conversation_analytics_cache 
        WHERE (cost_credits > 0 OR duration_seconds > 0) 
        AND user_id IS NOT NULL
        ORDER BY call_date DESC
    LOOP
        -- Calculează costul bazat pe durată
        calculated_cost := ROUND((conversation.duration_seconds / 60.0) * cost_per_minute, 2);
        
        -- Folosește cost_credits dacă există, altfel costul calculat
        IF conversation.cost_credits > 0 THEN
            calculated_cost := conversation.cost_credits / 100.0; -- Presupunem că cost_credits e în cents
        END IF;
        
        -- Încearcă să deduci costul din sold (doar dacă > 0)
        IF calculated_cost > 0 THEN
            -- Încearcă deducerea (funcția returnează false dacă sold insuficient)
            PERFORM deduct_balance(
                conversation.user_id,
                calculated_cost,
                'Retroactiv - Apel din ' || conversation.call_date::date,
                conversation.conversation_id::uuid
            );
            
            -- Actualizează și statisticile utilizatorului
            PERFORM update_user_statistics_with_spending(
                conversation.user_id,
                conversation.duration_seconds,
                calculated_cost
            );
            
            RAISE NOTICE 'Procesat: User % - Conversație % - Cost: $% - Durată: %s', 
                conversation.user_id, conversation.conversation_id, calculated_cost, conversation.duration_seconds;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Finalizat procesarea retroactivă a costurilor!';
END $$;