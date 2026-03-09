-- ================================================================
-- BlackBelt — Lead Acquisition Seed
-- ================================================================
-- Run AFTER lead migrations
-- This seed prepares the Super Admin captacao module with realistic
-- B2B sales data for QA and demo flows.

INSERT INTO academies (id, name, slug, owner_id, settings, address, phone, email, status)
VALUES (
  '00000000-0000-0000-0000-000000000091',
  'BlackBelt Growth Demo',
  'blackbelt-growth-demo',
  '00000000-0000-0000-0000-000000000002',
  '{"plan":"enterprise"}'::jsonb,
  '{"street":"Rua Growth, 91","city":"Sao Paulo","state":"SP","zip":"01000-091","country":"Brasil"}'::jsonb,
  '+55 11 98888-0091',
  'growth-demo@blackbelt.app',
  'active'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO leads (
  id,
  academy_name,
  responsible_name,
  email,
  phone,
  city,
  state,
  address,
  modalities,
  current_students,
  monthly_revenue,
  lead_source,
  website,
  instagram,
  status,
  suggested_price,
  proposed_price,
  closed_price,
  assigned_to,
  created_at,
  updated_at,
  converted_at,
  converted_academy_id,
  loss_reason,
  notes
)
VALUES
  ('10000000-0000-0000-0000-000000000001','Alliance Growth Center','Carlos Mendes','carlos@alliance-growth.com','+55 11 99999-0001','Sao Paulo','SP','Av Paulista, 1000',ARRAY['BJJ','Muay Thai'],220,68000,'outbound','https://alliance-growth.com','@alliancegrowth','NEW',699,null,null,null,NOW()-INTERVAL '14 days',NOW()-INTERVAL '14 days',null,null,null,'Lead enterprise com forte potencial'),
  ('10000000-0000-0000-0000-000000000002','Gracie Evolution Hub','Ana Ribeiro','ana@gracieevolution.com','+55 21 99999-0002','Rio de Janeiro','RJ','Barra da Tijuca, 210',ARRAY['BJJ'],180,52000,'referral','https://gracieevolution.com','@gracieevolution','QUALIFIED',599,null,null,null,NOW()-INTERVAL '12 days',NOW()-INTERVAL '9 days',null,null,null,'Busca troca de sistema ainda neste trimestre'),
  ('10000000-0000-0000-0000-000000000003','CT Trovão MMA','Paulo Araujo','paulo@cttrovao.com','+55 31 99999-0003','Belo Horizonte','MG','Savassi, 45',ARRAY['MMA','Boxe','Muay Thai'],130,41000,'instagram','https://cttrovao.com','@cttrovao','OUTREACH_STARTED',549,549,null,null,NOW()-INTERVAL '10 days',NOW()-INTERVAL '5 days',null,null,null,'Interessado em CRM e check-in'),
  ('10000000-0000-0000-0000-000000000004','Academia Samurai Kids','Mariana Alves','mariana@samuraikids.com','+55 41 99999-0004','Curitiba','PR','Batel, 300',ARRAY['Karate','Judo'],95,24000,'website','https://samuraikids.com','@samuraikids','MEETING_SCHEDULED',399,449,null,null,NOW()-INTERVAL '8 days',NOW()-INTERVAL '3 days',null,null,null,'Reuniao marcada para apresentar modulo kids'),
  ('10000000-0000-0000-0000-000000000005','Checkmat Performance Lab','Roberto Lima','roberto@checkmatlab.com','+55 71 99999-0005','Salvador','BA','Pituba, 77',ARRAY['BJJ','MMA'],260,78000,'event','https://checkmatlab.com','@checkmatlab','PROPOSAL_SENT',799,799,null,null,NOW()-INTERVAL '7 days',NOW()-INTERVAL '2 days',null,null,null,'Proposta enviada aguardando retorno'),
  ('10000000-0000-0000-0000-000000000006','Muay Thai Downtown','Julia Castro','julia@muaydowntown.com','+55 11 99999-0006','Campinas','SP','Cambuí, 88',ARRAY['Muay Thai'],85,18000,'outbound','https://muaydowntown.com','@muaydowntown','NEGOTIATING',349,329,null,null,NOW()-INTERVAL '6 days',NOW()-INTERVAL '1 day',null,null,null,'Negociando desconto por multiunidade futura'),
  ('10000000-0000-0000-0000-000000000007','Carlson Gracie Expansion','Fernando Souza','fernando@carlsongrowth.com','+55 19 99999-0007','Campinas','SP','Taquaral, 12',ARRAY['BJJ'],300,92000,'referral','https://carlsongrowth.com','@carlsongrowth','WON',899,899,899,null,NOW()-INTERVAL '20 days',NOW()-INTERVAL '1 day',NOW()-INTERVAL '1 day','00000000-0000-0000-0000-000000000091',null,'Lead convertido em cliente'),
  ('10000000-0000-0000-0000-000000000008','Dojo Tradicao','Sergio Moraes','sergio@dojotradicao.com','+55 51 99999-0008','Porto Alegre','RS','Moinhos, 19',ARRAY['Judo','Karate'],40,9000,'manual',null,'@dojotradicao','LOST',199,199,null,null,NOW()-INTERVAL '18 days',NOW()-INTERVAL '4 days',null,null,'SMALL_ACADEMY','Academia ainda pequena para o plano atual')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lead_tasks (id, lead_id, title, description, due_at, status, created_at)
VALUES
  ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','Enviar estudo de caso','Compartilhar case de academias com mais de 150 alunos',NOW()+INTERVAL '1 day','OPEN',NOW()),
  ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000004','Preparar demo kids','Destacar jornada do responsavel e check-in',NOW()+INTERVAL '2 days','OPEN',NOW()),
  ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000006','Follow-up de negociacao','Revisar proposta com opcao de onboarding premium',NOW()+INTERVAL '8 hours','IN_PROGRESS',NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO lead_proposals (id, lead_id, proposal_value, currency, status, sent_at, accepted_at, pdf_url, version, created_at)
VALUES
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000005',799,'BRL','SENT',NOW()-INTERVAL '2 days',null,'/api/leads/proposal?proposalId=30000000-0000-0000-0000-000000000001',1,NOW()-INTERVAL '2 days'),
  ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000006',329,'BRL','VIEWED',NOW()-INTERVAL '1 day',null,'/api/leads/proposal?proposalId=30000000-0000-0000-0000-000000000002',1,NOW()-INTERVAL '1 day'),
  ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000007',899,'BRL','ACCEPTED',NOW()-INTERVAL '3 days',NOW()-INTERVAL '1 day','/api/leads/proposal?proposalId=30000000-0000-0000-0000-000000000003',1,NOW()-INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lead_interactions (id, lead_id, type, content, created_at, interaction_at)
VALUES
  ('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','call','Ligacao inicial realizada com foco em check-in e CRM',NOW()-INTERVAL '5 days',NOW()-INTERVAL '5 days'),
  ('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000004','meeting','Reuniao de descoberta agendada com a direcao',NOW()-INTERVAL '2 days',NOW()-INTERVAL '2 days'),
  ('40000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000005','proposal_sent','Proposta comercial enviada por email',NOW()-INTERVAL '2 days',NOW()-INTERVAL '2 days'),
  ('40000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000007','status_change','Lead convertido em academia pagante',NOW()-INTERVAL '1 day',NOW()-INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;
