-- Leagă documentul existent de agentul creat
INSERT INTO agent_documents (agent_id, document_id) 
SELECT 
    aa.id as agent_id,
    kd.id as document_id
FROM ai_agents aa, knowledge_documents kd
WHERE aa.user_id = kd.user_id 
    AND aa.name = 'speek'
    AND kd.name = 'scraped-data-1751894818488_partea1 (1).txt'
    AND aa.user_id = 'a698e3c2-f0e6-4f42-8955-971d91e725ce';